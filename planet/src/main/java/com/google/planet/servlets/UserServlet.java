package com.google.planet.servlets;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/user")
public class UserServlet extends HttpServlet {
    static public String userName;
    static public String userEmail;
    static public String userPhone;

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
        UserServlet.userName = request.getParameter("name");
        UserServlet.userEmail = request.getParameter("email");
        UserServlet.userPhone = request.getParameter("phone");
        response.sendRedirect("/user");
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
        response.setContentType("text/html");
        // This part is for demos purposes. We will be using RequestDispatcher to forward the request to another JSP file
        RequestDispatcher reauestDispatcher = request.getRequestDispatcher("profile.jsp");
        reauestDispatcher.include(request, response);
    }
}
