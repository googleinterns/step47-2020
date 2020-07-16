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

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.GaeRequestHandler;
import com.google.gson.GsonBuilder;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;


@WebServlet("/generate-itinerary")
public class ItineraryServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        BufferedReader br = request.getReader();
        String eventsJson = "";
        // Test direction
        //getDistanceMatrix();

        if (br != null) {
            eventsJson = br.readLine();

            // Convert the json string to a list of events using Gson
            Type eventListType = new TypeToken<ArrayList<Event>>(){}.getType();
            List<Event> events = new Gson().fromJson(eventsJson, eventListType);

            ItineraryGenerator itineraryGenerator = new ItineraryGenerator();
            List<ItineraryItem> itinerary = itineraryGenerator.generateItinerary(events);

            response.setContentType("application/json");
            String json = new Gson().toJson(itinerary);
            response.getWriter().println(json);
        } else {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("");
        }
  }

    // private boolean getDistanceMatrix() {
    //     String ERROR_MESSAGE = "Couldn't find specified custom location, falling back to co-ordinates";
    //     String locationName = "Toronto";
    //     String GoogleApiKey = "AIzaSyDK36gDoYgOj4AlbCqh1IuaUuTlcpKF0ns";
    //     if (locationName == null || locationName.equals("")) {
    //         System.out.println(ERROR_MESSAGE);
    //         return false;
    //     }

    //     GeoApiContext context = new GeoApiContext.Builder(new GaeRequestHandler.Builder())
    //                         .apiKey(GoogleApiKey)
    //                         .build();
    //    try {
    //         GeocodingResult[] request = GeocodingApi.newRequest(context).address(locationName).await();
    //         LatLng location = request[0].geometry.location;
    //         double latitude = location.lat;
    //         double longitude = location.lng;
    //         System.out.println("Found custom location to be: " + request[0].formattedAddress);
    //         return true;
    //     } catch (Exception e) {
    //         System.out.println(ERROR_MESSAGE);
    //         return false;
    //     }
    // }
}

