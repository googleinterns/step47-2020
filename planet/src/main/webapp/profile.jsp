<!DOCTYPE html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.planet.servlets.UserServlet" %>
<html>

<head>
    <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
    <!-- Compiled and minified CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <!--Import Google Icon Font-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="css/profile.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8">
    <title><%= UserServlet.userName %></title>
</head>

<body>
    <div class="profile-container">
        <div class="row card">
            <div class="col s4">
                <img src="images/profile-pic.png" />
            </div>
            <div class="col s8" style="position: absolute; bottom: 0; left: 30%;">
                <h2 style="margin: 0"><%= UserServlet.userName %></h2>
                <div class="row valign-wrapper">
                    <i class="tiny material-icons col" style="padding-right: 0;">place</i>
                    <p class="col" style="padding-left: 0;">Waterloo, Canada</p>
                </div>
            </div>
        </div>
    </div>
    <!-- Compiled and minified JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>

</html>