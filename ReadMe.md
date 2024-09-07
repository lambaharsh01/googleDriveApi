1. Create a project on google cloud console
2. Enable google drive api
3. Create service account and get credentials
4. Create a folder in your google drive , open it and the copy the folder's id from the URL
5. Replace the enviroment variables with yours Keys in .env file
6. open upload.html in your browser and upload the files onto your drive folder.
7. the uploaded files will be viewable by all to mitigate that you can remove the view parameters in uploadFile function in uploadFileDrive.js
