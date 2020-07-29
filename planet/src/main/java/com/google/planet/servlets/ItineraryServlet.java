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
import java.lang.reflect.*;
import com.google.gson.reflect.TypeToken;

import com.google.planet.data.Event;
import com.google.planet.data.ItineraryGenerator;
import com.google.planet.data.ItineraryItem;
import com.google.planet.data.ItineraryOrder;
import com.google.planet.data.Itinerary;
import com.google.planet.data.TimeRange;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
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
import java.io.BufferedReader;

@WebServlet("/generate-itinerary")
public class ItineraryServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        BufferedReader br = request.getReader();
        String optimizedString = request.getParameterMap().get("optimized")[0];
        String eventsJson = "";

        if (br != null) {
            eventsJson = br.readLine();

            // Convert the json string to a list of events using Gson
            Type eventListType = new TypeToken<ArrayList<Event>>(){}.getType();
            List<Event> events = new Gson().fromJson(eventsJson, eventListType);

            ItineraryGenerator itineraryGenerator = new ItineraryGenerator();
            Itinerary itinerary = null;
            if (optimizedString.equals("true")){
                itinerary = itineraryGenerator.generateItinerary(events, ItineraryOrder.OPTIMIZED);
            } else if (optimizedString.equals("false")){
                itinerary = itineraryGenerator.generateItinerary(events, ItineraryOrder.OPTIMIZED);
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println("Optimized can only be true or false");
                return;
            }
                
            if (itinerary.errorMessage != null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().println(itinerary.errorMessage);
                return;
            }

            response.setContentType("application/json");
            String json = new Gson().toJson(itinerary);
            response.getWriter().println(json);
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("");
        }
  }
}
