from pydantic import BaseModel
from typing import Optional

class BlogBase(BaseModel):
    title: str
    date: str
    category: str
    image: str
    content: str
    points: Optional[str] = None
    categories: Optional[str] = None

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: int

    class Config:
        from_attributes = True
