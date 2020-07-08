package com.google.planet.servlets;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/user")
public class UserServlet extends HttpServlet {
    private String userName;
    private String userEmail;
    private String userPhone;

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
        this.userName = request.getParameter("name");
        this.userEmail = request.getParameter("email");
        this.userPhone = request.getParameter("phone");
        response.sendRedirect("/user");
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
        response.setContentType("text/html");
        // This part is for demos purposes. We will be using RequestDispatcher to forward the request to another JSP file
        response.getWriter().println("<html>");
        response.getWriter().println("<head>");
        response.getWriter().println("</head>");
        response.getWriter().println("<body>");
        response.getWriter().println("<h2>Welcome to your profile " + this.userName + "</h2>");
        response.getWriter().println("<h3>Your email adress: " + this.userEmail + "</h3>");
        response.getWriter().println("<h3>Your phone number: " + this.userPhone + "</h3>");
        response.getWriter().println("</body>");
        response.getWriter().println("</html>");
    }
}