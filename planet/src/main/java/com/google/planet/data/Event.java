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
    private final long id;
    private final String name; 
    private final String address;
    private final double duration; // Duration in hours.
    private final TimeRange openingHours;
    private final String listName; 
    private final String userId;
    private final long order;

    public Event(long id, String name, String address, double duration, TimeRange openingHours, long order, String listName, String userId) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.duration = duration;
        this.openingHours = openingHours;
        this.order = order;
        this.listName = listName;
        this.userId = userId;
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
        return this.openingHours;
    }

    /**
    * A comparator for sorting events by the duration of their opening hours, in ascending order.
    */
    public static final Comparator<Event> ORDER_BY_OPENING_HOURS = new Comparator<Event>() {
        @Override
        public int compare(Event a, Event b) {
        return Long.compare(a.openingHours.duration(), b.openingHours.duration());
        }
    };
}

