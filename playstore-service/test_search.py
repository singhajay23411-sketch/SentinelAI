import requests
import re
from google_play_scraper import search

print("Search results:")
res = search("meesho", n_hits=5)
for r in res:
    print(r.get("appId"))

print("\nRegex approach:")
html = requests.get("https://play.google.com/store/search?q=meesho&c=apps").text
print(re.findall(r'href="/store/apps/details\?id=([^"]+)"', html)[:5])
