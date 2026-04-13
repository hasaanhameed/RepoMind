# Libraries for handling file operations
import os
import shutil
import stat
import tempfile

# Library for cloning GitHub repositories
from git import Repo

# Library for creating tools in LangChain
from langchain.tools import tool
from app.services.embedding_service import store_file

SUPPORTED_EXTENSIONS = {
    # Python
    ".py",
    # JavaScript / TypeScript
    ".js", ".ts", ".jsx", ".tsx",
    # Java
    ".java",
    # C / C++
    ".c", ".cpp", ".h", ".hpp",
    # C#
    ".cs",
    # Go
    ".go",
    # Rust
    ".rs",
    # Ruby
    ".rb",
    # PHP
    ".php",
    # Swift
    ".swift",
    # Kotlin
    ".kt",
    # Dart
    ".dart",
    # Shell
    ".sh", ".bash",
    # Docs
    ".md", ".txt",
    # Config
    ".json", ".yaml", ".yml", ".toml",
    # SQL
    ".sql",
}

@tool
def clone_and_embed_repo(github_url: str) -> str:
    """Clones a GitHub repository and embeds all its code files into the vector database."""
    
    temp_dir = tempfile.mkdtemp()
    
    try:
        Repo.clone_from(github_url, temp_dir)
        embedded_count = 0
        for root, dirs, files in os.walk(temp_dir):
            dirs[:] = [d for d in dirs if d not in [".git", "node_modules", "__pycache__"]]
            for file in files:
                if any(file.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                    file_path = os.path.join(root, file)
                    store_file(file_path)
                    embedded_count += 1
        return f"Successfully embedded {embedded_count} files from {github_url}"
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