package com.google.planet.servlets;

import java.io.FileInputStream;
import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

@WebServlet("/user/*")
public class UserServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ServletException {
    final String username = request.getPathInfo().substring(1);
    UserServlet.initializeFirebase();
    final FirebaseDatabase database = FirebaseDatabase.getInstance();
    final DatabaseReference reference = database.getReference("/users");
    reference.orderByChild("username").equalTo(username).addListenerForSingleValueEvent(
    new ValueEventListener() {
      @Override
      public void onDataChange(DataSnapshot dataSnapshot) {
        if (!dataSnapshot.exists()) {
          System.out.println("Profile Not Found");
          return;
        }
      }
      
      @Override
      public void onCancelled(DatabaseError databaseError) {
        // This method has to be overrided that's why I'm adding it
      }     
    });
    request.setAttribute("username", username);
    final RequestDispatcher requestDispatcher = request.getRequestDispatcher("/profile.jsp");
    requestDispatcher.forward(request, response);
  }

  public static void initializeFirebase() throws IOException {
    try {
      FirebaseApp.getInstance();
    } catch (IllegalStateException exception) {
      final FileInputStream refreshToken = new FileInputStream("service-key/ndabouz-step-2020-2-b7a5e859eaaf.json");
      final FirebaseOptions options = new FirebaseOptions.Builder()
          .setCredentials(GoogleCredentials.fromStream(refreshToken))
          .setDatabaseUrl("https://ndabouz-step-2020-2.firebaseio.com/")
          .build();
      FirebaseApp.initializeApp(options);
    }
  }
}
