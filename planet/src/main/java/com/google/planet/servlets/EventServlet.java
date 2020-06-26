// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.planet.servlets;
import com.google.gson.Gson;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.planet.data.Event;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.lang.*; 
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that handles the game two truths and one lie */

@WebServlet("/update-event")
public class EventServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Wait 50 ms for datastore to update changes
        try{
            Thread.sleep(50);
        }catch(InterruptedException ex){
            Thread.currentThread().interrupt();
        }

        Query query = new Query("Event");
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        PreparedQuery results = datastore.prepare(query);

        List<Event> events = new ArrayList<>();
        for (Entity entity : results.asIterable()) {
            long id = entity.getKey().getId();
            String name = (String) entity.getProperty("name");
            String address = (String) entity.getProperty("address");
            double duration = (double) entity.getProperty("duration");
            String preferredTime = (String) entity.getProperty("preferredTime");
            String userId = (String) entity.getProperty("userId");

            Event event = new Event(id, name, address, duration, preferredTime, userId);
            events.add(event);
        }

        response.setContentType("application/json");
        String json = new Gson().toJson(events);
        response.getWriter().println(json);
  }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("add-event-name");
        String address = request.getParameter("add-event-address");
        Double duration = Double.valueOf(request.getParameter("add-event-duration"));
        String preferredTime = request.getParameter("add-event-timerange");
        String userId = "123";

        Entity eventEntity = new Entity("Event");
        eventEntity.setProperty("name", name);
        eventEntity.setProperty("address", address);
        eventEntity.setProperty("duration", duration);
        eventEntity.setProperty("preferredTime", preferredTime);
        eventEntity.setProperty("userId", userId);

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.put(eventEntity);
        response.sendRedirect("/itinerary.html");
    }

    @Override
    public void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        long id = Long.valueOf(request.getParameterMap().get("id")[0]);

        /*Create the key of to-be-deleted event. */
        Key eventEntityKey = KeyFactory.createKey("Event", id);
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.delete(eventEntityKey);
        response.sendRedirect("/itinerary.html");
    }
}

