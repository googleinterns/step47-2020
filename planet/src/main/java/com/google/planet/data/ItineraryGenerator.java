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

package com.google.planet.data;

import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;


import com.google.maps.GeoApiContext;
import com.google.maps.DistanceMatrixApi;
import com.google.maps.GaeRequestHandler;
import com.google.gson.GsonBuilder;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.DistanceMatrix;
import com.google.maps.model.DistanceMatrixRow;
import com.google.maps.model.DistanceMatrixElement;
import com.google.maps.model.Duration;
import com.google.maps.DistanceMatrixApiRequest;
import com.google.maps.*;

public final class ItineraryGenerator {
    public List<ItineraryItem> generateItinerary(List<Event> events) { 
        // Return an empty list if events are empty or only contains the starting point event
        if (events.size() <= 1) { 
            return Arrays.asList();
        }
        // For the prototype, just find the shortest opening hours and 
        // schedule all events within that time range
        Collections.sort(events, Event.SortByOpeningHours);
        int START = events.get(0).getOpeningHours().start();
        int END = events.get(0).getOpeningHours().end();

        Collections.sort(events, Event.SortByOrder);
        int [][] travelTimeGraph = getTravelTimeGraph(events);
        getEventsDistanceMatrix();
        List<ItineraryItem> items = scheduleItineraryInOrder(events, START, END, travelTimeGraph);
        return items;
    }

    // Function that creates a graph with the events as vertices and the travelling
    // time between the events as edges.
    // For the prototype, all travelling times are set to 15 minutes 
    private boolean getEventsDistanceMatrix() {
        String GoogleApiKey = "AIzaSyDK36gDoYgOj4AlbCqh1IuaUuTlcpKF0ns";
        String[] origins = new String[] {"Vancouver+BC", "San+Francisco" };
        String[] destinations = new String[] {"Vancouver+BC", "San+Francisco"};

        GeoApiContext context = new GeoApiContext.Builder(new GaeRequestHandler.Builder())
                            .apiKey(GoogleApiKey)
                            .build();
       try {
            DistanceMatrix result = DistanceMatrixApi.getDistanceMatrix(context,
                                                         origins,
                                                         destinations).await();
            DistanceMatrixRow[] rows = result.rows;
            DistanceMatrixElement[] elements = rows[0].elements;
            Duration duration = elements[1].duration;
            System.out.println(duration.humanReadable);
            return true;
        } catch (Exception e) {
            System.out.println(e);
            return false;
        }
    }

    private int[][] getTravelTimeGraph(List<Event> events) {
        int numOfNodes = events.size();
        int[][] travelTimeGraph = new int[numOfNodes][numOfNodes];
        for (int i = 0; i < travelTimeGraph.length; i++) {
            for (int j = 0; j < travelTimeGraph[i].length; j++) {
                if (i == j) {
                    travelTimeGraph[i][j] = 0;
                }else{
                    travelTimeGraph[i][j] = 15;
                }
            }
        }
        return travelTimeGraph;
    }

    // Function that creates an itinerary by scheduling each event in order.
    private List<ItineraryItem> scheduleItineraryInOrder(List<Event> events, int openningTime, int endingTime, 
                                                        int[][] travelTimeGraph) {
        List<ItineraryItem> items = new ArrayList<>();
        int start = openningTime; 
        for (int i = 0; i < events.size(); i++){
            Event event = events.get(i);

            // Add the event as an itinerary item if the remaining available time is longer than the
            // event duration.
            if (start + event.getDurationInMinutes() <= endingTime) {
                ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(),
                    TimeRange.fromStartDuration(start, event.getDurationInMinutes()));
                items.add(item);

                // Update the next event's start time
                if (i != events.size() - 1) { 
                    start += event.getDurationInMinutes() + travelTimeGraph[i][i+1];
                }
            }else {
                System.out.println("Sorry, you have too many events in a day!");
                return Arrays.asList();
            }
        }
        return items;
    }
}


