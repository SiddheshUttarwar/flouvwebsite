import requests

print("Testing API...")
try:
    # 1. Test GET /api/blogs
    res = requests.get("http://localhost:8000/api/blogs")
    print(f"GET /api/blogs: {res.status_code}")
    
    # 2. Test POST /api/upload with a dummy file
    files = {'file': ('test.txt', 'hello world', 'text/plain')}
    res = requests.post("http://localhost:8000/api/upload", files=files)
    print(f"POST /api/upload: {res.status_code}")
    if res.status_code != 200:
        print(res.text)
        
except Exception as e:
    print(f"Error connecting: {e}")
