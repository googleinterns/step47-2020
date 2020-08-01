package com.google.planet.servlets;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/user/*")
public class UserServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
    final String username = request.getPathInfo().substring(1);
    final String blobKey = request.getParameter("blob-key");
    request.setAttribute("username", username);
    request.setAttribute("blob-key", blobKey);
    final RequestDispatcher requestDispatcher = request.getRequestDispatcher("/profile.jsp");
    requestDispatcher.forward(request, response);
  }
}
