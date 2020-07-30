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

import com.google.maps.model.Duration;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsRoute;
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
import org.mockito.Mockito;

/**
 * Unit tests for {ItineraryGenerator}.
 */
@RunWith(JUnit4.class)
public final class ItineraryGeneratorTest {
    private static final int TIME_0800AM = TimeRange.getTimeInMinutes(8, 0);
    private static final int TIME_0500PM = TimeRange.getTimeInMinutes(17, 0);
    private static final double DURATION_1HOUR = 1;
    private static final double DURATION_2HOUR = 2;
    private static final double DURATION_6HOUR = 6;
    private static final long DURATION_30MINUTES_INSECONDS = 30 * 60;
    private static final long DURATION_1HOUR_INSECONDS = 60 * 60;
    
    private ItineraryGenerator itinerary;

    @Before
    public void setUp() {
        itinerary = Mockito.spy(new ItineraryGenerator());
    }

    public DirectionsRoute constructFakeDirectionsRouteInOrder(long[] durationsInSeconds) {
        DirectionsRoute route = new DirectionsRoute();
        route.legs = new DirectionsLeg[durationsInSeconds.length];
        for (int i = 0; i < durationsInSeconds.length; i++) {
            Duration duration = new Duration();
            duration.inSeconds = durationsInSeconds[i];
            DirectionsLeg leg = new DirectionsLeg();
            leg.duration = duration;
            route.legs[i] = leg;
        }
        return route;
    }

    @Test
    public void scheduleItineraryInOrder() throws Exception {
        List<Event> events = new ArrayList<>();

        Event start = new Event("Start", "Address 0", 0);
        Event event1 = new Event("Event 1", "Address 1", DURATION_1HOUR, TIME_0800AM, TIME_0500PM, 1);
        Event event2 = new Event("Event 2", "Address 2", DURATION_2HOUR, TIME_0800AM, TIME_0500PM, 2);
        Event event3 = new Event("Event 3", "Address 3", DURATION_1HOUR, TIME_0800AM, TIME_0500PM, 3);
        events.add(start);
        events.add(event1);
        events.add(event2);
        events.add(event3);

        // Mock Directions API result
        long[] durationsInSeconds = {DURATION_30MINUTES_INSECONDS,
                                    DURATION_30MINUTES_INSECONDS, 
                                    DURATION_1HOUR_INSECONDS,
                                    DURATION_1HOUR_INSECONDS};
        Mockito.doReturn(constructFakeDirectionsRouteInOrder(durationsInSeconds)).
            when(itinerary).getDirectionsRoute(events, ItineraryOrder.UNOPTIMIZED);
       
        List<ItineraryItem> actual = itinerary.generateItinerary(events);
        List<ItineraryItem> expected = Arrays.asList(
            new ItineraryItem("Start", "Address 0", TimeRange.fromStartEnd(480, 480)),
            new ItineraryItem("Event 1", "Address 1", TimeRange.fromStartEnd(510, 570)),
            new ItineraryItem("Event 2", "Address 2", TimeRange.fromStartEnd(600, 720)),
            new ItineraryItem("Event 3", "Address 3", TimeRange.fromStartEnd(780, 840))
        );

        Assert.assertEquals(expected, actual);
    }

    // @Test
    // public void tooManyEvents() {
    // // When too many events are scheduled in one day, the function should return an 
    // // empty list.
    //     // List<Event> events = new ArrayList<>();

    //     // Event hotel = new Event("Start", "Washington,DC", 0);
    //     // Event event1 = new Event("Event 1", "Victoria+BC", 3, TIME_0800AM, TIME_0500PM, 1);
    //     // Event event2 = new Event("Event 2", "San+Francisco", 9, TIME_0800AM, TIME_0500PM, 2);
    //     // events.add(hotel);
    //     // events.add(event1);
    //     // events.add(event2);
    //     // List<ItineraryItem> actual = itinerary.generateItinerary(events);
    //     // List<ItineraryItem> expected = Arrays.asList();

    //     // Assert.assertEquals(expected, actual);
    // }
}

