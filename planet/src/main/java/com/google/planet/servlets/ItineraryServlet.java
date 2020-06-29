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

import com.google.planet.data.Event;
import com.google.planet.data.ItineraryGenerator;
import com.google.planet.data.ItineraryItem;
import com.google.planet.data.TimeRange;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
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

@WebServlet("/generate-itinerary")
public class ItineraryServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Query query = new Query("Event");
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        PreparedQuery results = datastore.prepare(query);

        // Get list of events from Datastore
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

        ItineraryGenerator itineraryGenerator = new ItineraryGenerator();
        List<ItineraryItem> itinerary = itineraryGenerator.generateItinerary(events);

        response.setContentType("application/json");
        String json = new Gson().toJson(itinerary);
        response.getWriter().println(json);
  }
}

