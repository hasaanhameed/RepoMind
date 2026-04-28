# Libraries for handling file operations
import os
import shutil
import stat
import tempfile

# Library for cloning GitHub repositories
from git import Repo

# Library for creating tools in LangChain
from langchain.tools import tool
from app.services.embedding_service import store_file, delete_repo_data
from app.services.ingestion_status_service import ingestion_status_service
from app.utils.repo_utils import generate_file_tree, SUPPORTED_EXTENSIONS

@tool
async def clone_and_embed_repo(github_url: str) -> str:
    """Clones a GitHub repository and embeds all its code files into the vector database."""
    
    temp_dir = tempfile.mkdtemp()
    try:
        await ingestion_status_service.update_status(github_url, "cloning", message="Cleaning up old data...")
        await delete_repo_data(github_url)
        
        await ingestion_status_service.update_status(github_url, "cloning", message="Cloning repository from GitHub...")
        Repo.clone_from(github_url, temp_dir)
        
        # Count total supported files first for progress calculation
        supported_files = []
        for root, dirs, files in os.walk(temp_dir):
            dirs[:] = [d for d in dirs if d not in [".git", "node_modules", "__pycache__"]]
            for file in files:
                if any(file.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                    supported_files.append(os.path.join(root, file))
        
        total_files = len(supported_files)
        embedded_count = 0
        
        await ingestion_status_service.update_status(github_url, "embedding", current=0, total=total_files, message="Starting file embedding...")
        
        for file_path in supported_files:
            rel_path = os.path.relpath(file_path, temp_dir)
            await ingestion_status_service.update_status(
                github_url, 
                "embedding", 
                current=embedded_count + 1, 
                total=total_files, 
                message=f"Embedding: {rel_path}"
            )
            
            await store_file(file_path, github_url)
            embedded_count += 1
                    
        await ingestion_status_service.update_status(github_url, "completed", current=total_files, total=total_files, message="Ingestion finished successfully.")
        
        # Finally, generate a complete file tree for AI "Global Awareness"
        repo_tree = generate_file_tree(temp_dir)
        await ingestion_status_service.save_repo_tree(github_url, repo_tree)
        
        return f"Successfully embedded {embedded_count} files and generated project map for {github_url}"
    except Exception as e:
        await ingestion_status_service.update_status(github_url, "error", message=f"Error: {str(e)}")
        raise e
    finally:
        def handle_remove_readonly(func, path, exc):
            try:
                os.chmod(path, stat.S_IWRITE)
                func(path)
            except Exception:
                pass
        
        try:
            shutil.rmtree(temp_dir, onexc=handle_remove_readonly)
        except TypeError:
            shutil.rmtree(temp_dir, onerror=handle_remove_readonly)