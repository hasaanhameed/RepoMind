import os

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

def generate_file_tree(start_path):
    """Generates a clean, indented text-based tree of the project structure."""
    tree = []
    base_name = os.path.basename(start_path.rstrip(os.path.sep))
    tree.append(f"{base_name}/")
    
    def _walk(current_path, prefix=""):
        try:
            items = sorted(os.listdir(current_path))
        except Exception:
            return
            
        # Filter out noisy directories
        items = [item for item in items if item not in [".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"]]
        
        for i, item in enumerate(items):
            path = os.path.join(current_path, item)
            is_last = (i == len(items) - 1)
            connector = "└── " if is_last else "├── "
            
            if os.path.isdir(path):
                tree.append(f"{prefix}{connector}{item}/")
                new_prefix = prefix + ("    " if is_last else "│   ")
                _walk(path, new_prefix)
            else:
                if any(item.endswith(ext) for ext in SUPPORTED_EXTENSIONS):
                    tree.append(f"{prefix}{connector}{item}")
                    
    _walk(start_path)
    return "\n".join(tree)
