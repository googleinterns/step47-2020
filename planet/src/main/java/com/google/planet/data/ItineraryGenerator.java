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
import com.google.planet.data.ItineraryException;
import com.google.maps.GeoApiContext;
import com.google.maps.DirectionsApi;
import com.google.maps.DirectionsApiRequest;
import com.google.maps.GaeRequestHandler;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.Duration;

public class ItineraryGenerator {
    public List<ItineraryItem> generateItinerary(List<Event> events, ItineraryOrder optimized) throws ItineraryException{

        // Return an empty list if events are empty or only contains the starting point event
        if (events.size() <= 1) { 
            throw new ItineraryException("Itinerary can only be generated with at least one event!");
        }

        // For the MVP, just find the shortest opening hours and 
        // schedule all events within that time range
        Collections.sort(events, Event.SortByOpeningHours);
        int START = events.get(0).getOpeningHours().start();
        int END = events.get(0).getOpeningHours().end();

        Collections.sort(events, Event.SortByOrder);
        List<ItineraryItem> items = scheduleItinerary(events, START, END, optimized);
        return items;
    }

    // Function that creates an itinerary
    private List<ItineraryItem> scheduleItinerary(List<Event> events, int openingTime, int endingTime,
                                            ItineraryOrder optimized) throws ItineraryException {
        List<ItineraryItem> items = new ArrayList();
        DirectionsRoute directionsRoute = getDirectionsRoute(events, optimized);
        DirectionsLeg[] directionsLegs = directionsRoute.legs;
        int start = openingTime; 
        int eventIndex = 0;
        for (int i = 0; i < events.size(); i++){
            // waypointOrder gives the ordering of the wayPoints, excluding the origin.
            // Therefore, waypointOrder of [2, 0, 1] will correspond to event 3, 1, and 2, etc.
            if (i != 0) {
                eventIndex = directionsRoute.waypointOrder[i-1] + 1;
            }
            Event event = events.get(eventIndex);
            // Add the event as an itinerary item if the remaining available time is longer than the
            // event duration.
            if (start + event.getDurationInMinutes() <= endingTime) {
                ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(),
                    TimeRange.fromStartDuration(start, event.getDurationInMinutes()));
                items.add(item);

                // Update the next event's start time
                start += event.getDurationInMinutes() + getTravelDurationInMinutes(directionsLegs[i].duration);
            }else {
                throw new ItineraryException("Sorry, you have too many events in a day! Try removing some events or shorten their duration");
            }
        }
        return items;
    }

    // Function that makes a request to the Directions API and return a direction route
    // A DirectionsRoute has field legs, which is an array of DirectionsLegs
    // Each DirectionsLeg contains starting address, ending address, and duration
    // DirectionRoute also has int[] waypointOrder, which will contain the order of the waypoints
    // For the MVP, real time traffic is NOT used.
    public DirectionsRoute getDirectionsRoute(List<Event> events, ItineraryOrder optimized) throws ItineraryException{
        String origin = events.get(0).getAddress();
        String destination = origin; // The ending location should be assumed as the starting location 
                                     // since users most likely want a round trip
        String[] waypoints = getListOfWaypoints(events);
        GeoApiContext context = new GeoApiContext.Builder(new GaeRequestHandler.Builder())
                            .apiKey(Keys.GOOGLE_MAPS_API_KEY)
                            .build();
        DirectionsApiRequest directionsRequest = DirectionsApi.newRequest(context);
       try {
            DirectionsResult directionsResult =  directionsRequest
                                                .origin(origin)
                                                .destination(destination)
                                                .waypoints(waypoints)
                                                .optimizeWaypoints(optimized.value)
                                                .await();
            DirectionsRoute directionsRoute = directionsResult.routes[0];
            return directionsRoute;
        } catch (Exception e) {
            throw new ItineraryException("Oops, one of your addresses is invalid, please use a valid address.");
        }
    }

    private String[] getListOfWaypoints(List<Event> events) {
        String[] addressList = events.stream()
                                .filter(event -> event.getOrder() != 0)
                                .map(event -> event.getAddress())
                                .toArray(String[]::new);
        return addressList;
    }

    private int getTravelDurationInMinutes(Duration duration) {
        int travelDurationInMinutes = (int) Math.round(duration.inSeconds / 60);
        return travelDurationInMinutes;
    }
}
