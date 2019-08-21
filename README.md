# AuthorizationService
Service to handle authorization of the API Backend

TODO:
- GET /authorization -> if valid API key -> quota usage : 403
- POST /authorization ->if valid API key and enough quota -> quota usage -1  : 403

from other service:
app.use('/', pingAuthorization, pingAuthentification, myFunction);

"env": {
    "DB_USER": "",
    "DB_PASSWORD": "",
    "DB_HOST": "localhost",
    "DB_PORT": "27017",
    "DB_NAME": "evnotify"
}