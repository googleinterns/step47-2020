<!DOCTYPE html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.planet.servlets.UserServlet" %>
<% String username = (String) request.getAttribute("username"); %>
<html>

<head>
    <!-- Include the firebase and local JS files -->  
    <script src="https://www.gstatic.com/firebasejs/4.1.3/firebase.js"></script> 
    <script src="/js/authentication.js"></script>
    <script type="module" src="/js/headerRenderer.js"></script>
    <script type="module" src="/js/profile-events-renderer.js"></script>
    <script type="module" src="/js/aboutSectionRenderer.js"></script>
    <script type="module" src="/js/profile.js"></script>
    <link href='//fonts.googleapis.com/css?family=Marmelad' rel='stylesheet' type='text/css'>
    <!-- Compiled and minified CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <!--Import Google Icon Font-->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="/css/profile.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8">
    <title>Profile</title>
</head>

<body onload="loadUserInformation('<%= username %>')">
    <div id="not-found-message" style="display: none; font-size: 30px; font-family: initial;">
        Profile Not Found
    </div>
    <div id="profile-page" class="profile-container" style="display: none">
        <div id="profile-header" class="row card" style="background-color: #bbdefb;">
            <div class="col s3 valign-wrapper">
                <img class="center-align circle responsive-img" src="/images/profile-pic.png"/>
            </div>
            <div class="col s7" style="position: absolute; bottom: 0; left: 25%;">
                <div id="name-container" class="row valign-wrapper" style="margin: 0">
                    <h2 id="display-name" class="col s11" style="margin: 0; font-size: 3vw;"></h2>
                </div>
                <div id="location-container" class="row valign-wrapper" style="margin: 0">
                    <div id="location" class="col s11 valign-wrapper" style="margin: 0"></div>
                </div>
                <div id="bio-container" class="row valign-wrapper" style="margin: 0">
                    <div id="bio" class="col s11" style="margin: 0"></div>
                </div>
            </div>
        </div>
        <div>
            <ul class="tabs" style="background-color: #fff9c4;">
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
            <div id="about-section" class="row card" style="display: block;">
            </div>
            <div id="posts-section" style="display: none;">
                <!--This test will be deleted later -->
                This is the posts section
            </div>
            <div id="events-section" style="display: none;">
            </div>
        </div>
        <div id="reset-pwd-modal" class="modal" style="padding-bottom: 1vh;">Hello</div>
        <div id="list-visitors" class="modal" style="padding: 1vh; width: 35%">Hello</div>
        <div id="account-created-modal" class="modal" style="padding-bottom: 1vh;">Hello</div>
    </div>
    <!-- Compiled and minified JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>

</html>
