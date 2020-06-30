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

public final class ItineraryGenerator {
    public List<ItineraryItem> generateItinerary(List<Event> events) { 
        List<ItineraryItem> items = new ArrayList<>();
        boolean sessionIsFull = false;
        int start_morning = TimeRange.getTimeInMinutes(8, 0);
        int start_afternoon = TimeRange.getTimeInMinutes(12, 0);
        int start_evening = TimeRange.getTimeInMinutes(16, 0);

        for (Event event: events) {
            // First, try to schedule the event in their preferred session
            if (event.getPreferredTime().equals("8am - 12pm")) {
                if (start_morning + event.getDurationInMinutes() > TimeRange.getTimeInMinutes(11, 59) + 1) {
                    sessionIsFull = true;
                }else {
                    sessionIsFull = false; 
                    ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(), 
                        TimeRange.fromStartDuration(start_morning, event.getDurationInMinutes())); 
                    items.add(item);
                    start_morning += event.getDurationInMinutes();
                }  
            }else if (event.getPreferredTime().equals("12pm - 4pm")) {
                if (start_afternoon + event.getDurationInMinutes() > TimeRange.getTimeInMinutes(15, 59) + 1) {
                    sessionIsFull = true;
                }else {
                    sessionIsFull = false;
                    ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(), 
                        TimeRange.fromStartDuration(start_afternoon, event.getDurationInMinutes()));
                    items.add(item);
                    start_afternoon += event.getDurationInMinutes();
                }  
            }else if (event.getPreferredTime().equals("4pm - 8pm")) {
                if (start_evening + event.getDurationInMinutes() > TimeRange.getTimeInMinutes(19, 59) + 1) {
                    sessionIsFull = true;
                }else {
                    sessionIsFull = false;
                    ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(), 
                        TimeRange.fromStartDuration(start_evening, event.getDurationInMinutes()));
                    items.add(item);
                    start_evening += event.getDurationInMinutes();
                }  
            }

            // If the preferred session is full, choose another session, check if the other session is available, then add
            if (sessionIsFull){
                if (start_morning + event.getDurationInMinutes() <= TimeRange.getTimeInMinutes(11, 59) + 1) {
                    ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(), 
                        TimeRange.fromStartDuration(start_morning, event.getDurationInMinutes()));
                    items.add(item);
                    start_morning += event.getDurationInMinutes();
                }else if (start_afternoon + event.getDurationInMinutes() <= TimeRange.getTimeInMinutes(15, 59) + 1) {
                    ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(), 
                        TimeRange.fromStartDuration(start_afternoon, event.getDurationInMinutes()));
                    items.add(item);
                    start_afternoon += event.getDurationInMinutes();
                }else if (start_evening + event.getDurationInMinutes() <= TimeRange.getTimeInMinutes(19, 59) + 1) {
                    ItineraryItem item = new ItineraryItem(event.getName(), event.getAddress(), 
                        TimeRange.fromStartDuration(start_evening, event.getDurationInMinutes()));
                    items.add(item);
                    start_evening += event.getDurationInMinutes();
                }else {
                    System.out.println("Too many events in one day!");
                    return Arrays.asList();
                }
            }
        }
        return items;
    }
}


