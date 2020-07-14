<!DOCTYPE html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.planet.servlets.UserServlet" %>
<html>

<head>
    <script src="js/profile.js"></script>
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
        <div class="row card" style="height: 25vh; background-color: #bbdefb;">
            <div class="col s4">
                <img class="circle responsive-img" src="images/profile-pic.png" style="height: 25vh"/>
            </div>
            <div class="col s8" style="position: absolute; bottom: 0; left: 30%;">
                <h2 style="margin: 0"><%= UserServlet.userName %></h2>
                <div class="row valign-wrapper">
                    <i class="tiny material-icons col" style="padding-right: 0;">place</i>
                    <p class="col" style="padding-left: 0;">Waterloo, Canada</p>
                </div>
            </div>
        </div>
        <div>
            <ul class="tabs" style="background-color: #303f9f;">
                <li class="tab" onclick="switchSection('about-link', 'about-section')">
                    <a id="about-link" class="tab-link active">About</a>
                </li>
                <li class="tab" onclick="switchSection('posts-link', 'posts-section')">
                    <a id="posts-link" class="tab-link">Posts</a>
                </li>
                <li class="tab" onclick="switchSection('events-link', 'events-section')">
                    <a id="events-link" class="tab-link">Events</a>
                </li>
              </ul>
        </div>
        <div class="profile-content">
            <div id="about-section" style="display: block;">
                <!--This test will be deleted later -->
                This is the about section
            </div>
            <div id="posts-section" style="display: none;">
                <!--This test will be deleted later -->
                This is the posts section
            </div>
            <div id="events-section" style="display: none;">
                <!--This test will be deleted later -->
                This is the events section
            </div>
        </div>
    </div>
    <!-- Compiled and minified JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>

</html>