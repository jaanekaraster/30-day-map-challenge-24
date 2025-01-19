curl -X POST "https://accounts.spotify.com/api/token" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "grant_type=client_credentials" \
-u "b3f839138557459aafef04f2b1502d2c:ade5397fc01d4b97bfb48cccaf32d2f9"


[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("b3f839138557459aafef04f2b1502d2c:ade5397fc01d4b97bfb48cccaf32d2f9"))

//encoded string after running above line in powershell
YjNmODM5MTM4NTU3NDU5YWFmZWYwNGYyYjE1MDJkMmM6YWRlNTM5N2ZjMDFkNGI5N2JmYjQ4Y2NjYWYzMmQyZjk=

//send post request to spotify to get access token
curl -X POST https://accounts.spotify.com/api/token ^
  -H "Authorization: Basic YjNmODM5MTM4NTU3NDU5YWFmZWYwNGYyYjE1MDJkMmM6YWRlNTM5N2ZjMDFkNGI5N2JmYjQ4Y2NjYWYzMmQyZjk=" ^
  -d "grant_type=client_credentials"

  {"access_token":"BQB_EEQyamatNnJCM5rqTlbNsy9tvABMQ2rBuzKEylJv1ssgz_z_O-1394R8cbbT21ztfFQ5Irj3iovoQ2NFecdTyFrvguDcRn3maVu62Z20gv8PtCc","token_type":"Bearer","expires_in":3600}
  