import json
import logging
import redis.exceptions
from app.database.redis import redis_client

logger = logging.getLogger(__name__)

class IngestionStatusService:
    def __init__(self):
        self.redis = redis_client
        self.expire_time = 86400  # 24 hours
        self._fallback_storage = {}
        self._redis_available = True

    async def update_status(self, repo_url: str, status: str, current: int = 0, total: int = 0, message: str = ""):
        """
        Updates the ingestion status for a repository. Falls back to memory if Redis is down.
        """
        data = {
            "repo_url": repo_url,
            "status": status,
            "current": current,
            "total": total,
            "message": message
        }
        key = f"ingest_status:{repo_url}"
        
        try:
            await self.redis.set(key, json.dumps(data), ex=self.expire_time)
            self._redis_available = True
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
            if self._redis_available:
                logger.warning("⚠️ Redis server connection failed. Falling back to in-memory storage for ingestion status.")
                self._redis_available = False
            self._fallback_storage[key] = json.dumps(data)

    async def get_status(self, repo_url: str):
        """
        Retrieves the ingestion status. Falls back to memory if Redis is down.
        """
        key = f"ingest_status:{repo_url}"
        
        try:
            data = await self.redis.get(key)
            self._redis_available = True
            if data:
                return json.loads(data)
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
            if self._redis_available:
                logger.warning(" Redis server connection failed. Retrieval falling back to in-memory storage.")
                self._redis_available = False
            
            data = self._fallback_storage.get(key)
            if data:
                return json.loads(data)

        return {
            "repo_url": repo_url,
            "status": "not_started",
            "current": 0,
            "total": 0,
            "message": "No ingestion active for this repository."
        }

ingestion_status_service = IngestionStatusService()
