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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

/**
 * Unit tests for {ItineraryGenerator}.
 */
@RunWith(JUnit4.class)
public final class ItineraryGeneratorTest {
    private static final int TIME_0800AM = TimeRange.getTimeInMinutes(8, 0);
    private static final int TIME_0500PM = TimeRange.getTimeInMinutes(17, 0);
    
    private ItineraryGenerator itinerary;

    @Before
    public void setUp() {
        itinerary = new ItineraryGenerator();
    }

    @Test
    public void scheduleItineraryInOrder() {
        List<Event> events = new ArrayList<>();

        Event hotel = new Event("Hotel", "address", 0);
        Event event1 = new Event(123, "Event 1", "address", 1, 
            TimeRange.fromStartEnd(TIME_0800AM, TIME_0500PM), 1, "listName", "userId");
        Event event2 = new Event(123, "Event 2", "address", 2, 
            TimeRange.fromStartEnd(TIME_0800AM, TIME_0500PM), 2, "listName", "userId");
        Event event3 = new Event(123, "Event 3", "address", 3, 
            TimeRange.fromStartEnd(TIME_0800AM, TIME_0500PM), 3, "listName", "userId");
        events.add(event1);
        events.add(event2);
        events.add(event3);
        List<ItineraryItem> actual = itinerary.generateItinerary(events, hotel);
        List<ItineraryItem> expected = Arrays.asList(
            new ItineraryItem("Hotel", "address", TimeRange.fromStartEnd(480, 480)),
            new ItineraryItem("Event 1", "address", TimeRange.fromStartEnd(495, 555)),
            new ItineraryItem("Event 2", "address", TimeRange.fromStartEnd(570, 690)),
            new ItineraryItem("Event 3", "address", TimeRange.fromStartEnd(705, 885))
        );

        Assert.assertEquals(expected, actual);
    }

    @Test
    public void tooManyEvents() {
    // When too many events are scheduled in one day, the function should return an 
    // empty list.
        List<Event> events = new ArrayList<>();

        Event hotel = new Event("Hotel", "address", 0);
        Event event1 = new Event(123, "Event 1", "address", 3, 
            TimeRange.fromStartEnd(TIME_0800AM, TIME_0500PM), 1, "listName", "userId");
        Event event2 = new Event(123, "Event 2", "address", 9, 
            TimeRange.fromStartEnd(TIME_0800AM, TIME_0500PM), 2, "listName", "userId");
        events.add(event1);
        events.add(event2);
        List<ItineraryItem> actual = itinerary.generateItinerary(events, hotel);
        List<ItineraryItem> expected = Arrays.asList();

        Assert.assertEquals(expected, actual);
    }
}

