#Create MySQL Image for JSP Tutorial Application

FROM mysql:9.6

COPY ./sqlfiles/*.sql /docker-entrypoint-initdb.d/

EXPOSE 3306