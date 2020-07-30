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

import java.util.Comparator;

public final class Event {
    private final String name; 
    private final String address;
    private final double duration; // Duration in hours.
    private final int openingTime;
    private final int closingTime;
    private final long order;

    public Event(String name, String address, double duration, int openingTime, int closingTime, long order) {
        this.name = name;
        this.address = address;
        this.duration = duration;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.order = order;
    }

    // Constructor for the starting point event (hotel), which is not stored in the database
    public Event(String name, String address, double duration) {
        this.name = name;
        this.address = address;
        this.duration = duration;
        this.openingTime = TimeRange.START_OF_DAY; 
        this.closingTime = TimeRange.END_OF_DAY;
        this.order = 0;
    }

    public int getDurationInMinutes(){
        return (int) (this.duration * 60);
    }
    public String getName(){
        return this.name;
    }
    public String getAddress(){
        return this.address;
    }
    public TimeRange getOpeningHours(){
        return TimeRange.fromStartEnd(this.openingTime, this.closingTime);
    }
    public long getOrder(){
        return this.order;
    }

    /**
    * A comparator for sorting events by the duration of their opening hours, in ascending order.
    */
    public static final Comparator<Event> SortByOpeningHours = new Comparator<Event>() {
        @Override
        public int compare(Event a, Event b) {
            return Long.compare(a.getOpeningHours().duration(), b.getOpeningHours().duration());
        }
    };

    /**
    * A comparator for sorting events by the property order, in ascending order.
    */
    public static final Comparator<Event> SortByOrder = new Comparator<Event>() {
        @Override
        public int compare(Event a, Event b) {
            return Long.compare(a.order, b.order);
        }
    };
}

