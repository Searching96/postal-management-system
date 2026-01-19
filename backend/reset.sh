#!/bin/bash                                                                           
echo "Removing Docker containers and volumes..."                                      
docker compose down -v                                                                
echo "Rebuilding and starting containers..."                                          
docker compose up -d --build                                                          
echo "Done! Containers are starting..."