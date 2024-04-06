# Database
The database I use is MongoDB with the `mongoose` package. 

## Models
There are 2 models: one for storing `User` info, and one for storing `Timer`
info. Take a look at the model files themselves to understand the data schema
for each entity.

## Controllers
I'm partially using the Model-View-Controller (MVC) design for RbR. For the
database specifically, I use controllers to abstract the database operations so
the code is more maintainable (ex: let's say I migrate to an SQL database. I
only need to change the code in the controllers instead of every file that uses
a database operation). It also helps with development since I can switch between
the real database and testing database with a couple of lines instead of
changing the model import in every file. In a nutshell, it's more maintainable
for both development and deployment.
