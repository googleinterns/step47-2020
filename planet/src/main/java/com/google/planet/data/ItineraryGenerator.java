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
import java.util.stream.*;
import com.google.maps.GeoApiContext;
import com.google.maps.DistanceMatrixApi;
import com.google.maps.GaeRequestHandler;
import com.google.maps.model.DistanceMatrix;
import com.google.maps.model.DistanceMatrixRow;
import com.google.maps.model.DistanceMatrixElement;
import com.google.maps.model.Duration;

public final class ItineraryGenerator {
    private String errorMessage;
    
    public Itinerary generateItinerary(List<Event> events) {
        errorMessage = null; 
        
        // Return an empty list if events are empty or only contains the starting point event
        if (events.size() <= 1) { 
            errorMessage = "Itinerary can only be generated with at least one event!";
            Itinerary itinerary = new Itinerary(Arrays.asList(), errorMessage);
            return itinerary;
        }

        // For the MVP, just find the shortest opening hours and 
        // schedule all events within that time range
        Collections.sort(events, Event.SortByOpeningHours);
        int START = events.get(0).getOpeningHours().start();
        int END = events.get(0).getOpeningHours().end();

        Collections.sort(events, Event.SortByOrder);
        Duration [][] travelTimeGraph = getEventsDistanceMatrix(events);

        if (errorMessage != null) { 
            Itinerary itinerary = new Itinerary(Arrays.asList(), errorMessage);
            return itinerary;
        }

        List<ItineraryItem> items = scheduleItineraryInOrder(events, START, END, travelTimeGraph);
        Itinerary itinerary = new Itinerary(items, errorMessage);
        return itinerary;
    }

    // Function that creates a graph with the events as vertices and the travelling
    // time between the events as edges.
    // The order of this graph will be the same as the order of the events.
    // For the MVP, real time traffic is NOT used.
    // TODO: handle invalid addresses
    private Duration[][] getEventsDistanceMatrix(List<Event> events) {
        int numOfNodes = events.size();
        Duration[][] travelTimeGraph = new Duration[numOfNodes][numOfNodes];

        String GoogleApiKey = "AIzaSyDK36gDoYgOj4AlbCqh1IuaUuTlcpKF0ns";
        String[] origins = getListOfAddresses(events);
        String[] destinations = getListOfAddresses(events);
        GeoApiContext context = new GeoApiContext.Builder(new GaeRequestHandler.Builder())
                            .apiKey(GoogleApiKey)
                            .build();
       try {
            DistanceMatrix distanceMatrix = DistanceMatrixApi.getDistanceMatrix(context,
                                                         origins,
                                                         destinations).await();

            for (int i = 0; i < distanceMatrix.rows.length; i++) {
                DistanceMatrixRow currentRow = distanceMatrix.rows[i];
                for (int j = 0; j < currentRow.elements.length; j++) {
                    DistanceMatrixElement currentElement = currentRow.elements[j];
                    if (currentElement.duration != null) {
                        travelTimeGraph[i][j] = currentElement.duration;
                    } else {
                        errorMessage = "Oops, one of your addresses is invalid, please use a valid address.";
                    }
                }
            }
            return travelTimeGraph;
        } catch (Exception e) {
            errorMessage = "Oops, one of your addresses is invalid, please use a valid address.";
            return travelTimeGraph;
        }
    }

    private String[] getListOfAddresses(List<Event> events) {
        String[] addressList = events.stream()
                                .map(event -> event.getAddress())
                                .toArray(String[]::new);
        return addressList;
    }

    private int getTravelDurationInMinutes(Duration duration) {
        int travelDurationInMinutes = (int) Math.round(duration.inSeconds / 60);
        return travelDurationInMinutes;
    }

    // Function that creates an itinerary by scheduling each event in order.
    private List<ItineraryItem> scheduleItineraryInOrder(List<Event> events, int openningTime, int endingTime, 
                                                        Duration[][] travelTimeGraph) {
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
                    start += event.getDurationInMinutes() + getTravelDurationInMinutes(travelTimeGraph[i][i+1]);
                }
            }else {
                errorMessage = "Sorry, you have too many events in a day!";
                return Arrays.asList();
            }
        }
        return items;
    }
}
