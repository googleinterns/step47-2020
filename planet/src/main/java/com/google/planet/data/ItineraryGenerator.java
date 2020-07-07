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

public final class ItineraryGenerator {
    public List<ItineraryItem> generateItinerary(List<Event> events) { 

        // For the prototype, just find the shortest opening hours and 
        // schedule all events within that time range
        Collections.sort(events, Event.OrderByOpeningHours);
        int START = events.get(0).getOpeningHours().start();
        int END = events.get(0).getOpeningHours().end();

        int [][] travelTimeGraph = getTravelTimeGraph(events);
        List<ItineraryItem> items = scheduleItineraryInOrder(events, START, END, travelTimeGraph);
        return items;
    }

    // Function that creates a graph with the events as vertices and the travelling
    // time between the events as edges.
    // For the prototype, all travelling times are set to 15 minutes 
    public int[][] getTravelTimeGraph(List<Event> events) {
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
    public List<ItineraryItem> scheduleItineraryInOrder(List<Event> events, int openningTime, int endingTime, 
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


