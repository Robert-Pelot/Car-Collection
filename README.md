"Car_Collection" 


This project has undergone lots of changes over the last few days.

If you are looking to run this file/project there are a few things you will need:

Azure Container Storage to store your pictures.
Azure database to create your database.
    I will include some information on this at a later date.
You will need the DigiCertGlobalRootCa.crt.pem in your Server directory.
You will need node_modules (I used Node.js to create this project)


My .env file has the following lines in it:
      # Azure Storage Connection String
      AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=<your_account_name>;AccountKey=<your_account_key>;EndpointSuffix=core.windows.net
      
      # Database Connection Details
      DB_HOST=<your_database_host>  # e.g., "mydemoserver-mysql.mysql.database.azure.com"
      DB_USER=<your_database_user>  # e.g., "your_username"
      DB_PASSWORD=<your_database_password>  # e.g., "your_password"
      DB_NAME=<your_database_name>  # e.g., "your_database_name"
      DB_SSL_CA_PATH=<path_to_ssl_certificate>  # e.g., "path/to/your/ssl/certificate.crt.pem"
      DB_SSL_REJECT_UNAUTHORIZED=false  # Set to true for strict certificate validation
      DB_SSL_DEBUG=true  # Set to true for detailed SSL debug logs (optional)

      Explanation for each variable:
      AZURE_STORAGE_CONNECTION_STRING: You need to get the connection string for your Azure Blob Storage account. This can be found in the Azure portal under the "Access keys" section of your storage account.
      DB_HOST: This is the address of your database server (e.g., "mydemoserver-mysql.mysql.database.azure.com"). It’s provided by your database service, such as Azure MySQL.
      DB_USER: The username for accessing your MySQL database.
      DB_PASSWORD: The password corresponding to your database username.
      DB_NAME: The name of the database you want to connect to.
      DB_SSL_CA_PATH: If you're using SSL to connect to your database, you need to specify the path to the SSL certificate (which you can obtain from the database provider).
      DB_SSL_REJECT_UNAUTHORIZED: Set this to true if you want to enforce SSL certificate validation. Set it to false only if you're handling certificates manually.
      DB_SSL_DEBUG: Set this to true if you need detailed logs for debugging SSL connections.
      Make sure you replace the placeholder values (<your_account_name>, <your_database_user>, etc.) with your actual credentials from your cloud provider and database service.
      This keeps your credentials safe while providing clear instructions on what each variable represents and how to get it.

      Sorry - you can't have mine.

      In your Azure setup - you will need to add a firewall that allows you to access your server. This is done in the Networking tab of your mysql server.
      In your Azure you need to set up a Blob container to send your images to.  
      
