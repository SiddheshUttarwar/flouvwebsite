from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class BlogCategoryLink(Base):
    __tablename__ = "blog_category_links"
    blog_id = Column(Integer, ForeignKey("blogs.id"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), primary_key=True)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    blogs = relationship("Blog", secondary="blog_category_links", back_populates="categories")

class BlogPoint(Base):
    __tablename__ = "blog_points"
    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.id"))
    point_text = Column(String)
    
    blog = relationship("Blog", back_populates="points")

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(String)
    # Replaced 'category' string with relation below
    image = Column(String)
    content = Column(Text)
    
    # Replaced JSON strings 'points' and 'categories' with relations
    categories = relationship("Category", secondary="blog_category_links", back_populates="blogs")
    points = relationship("BlogPoint", back_populates="blog", cascade="all, delete-orphan")
