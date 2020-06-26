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

public final class Event {

    private final long id;
    private final String name; 
    private final String address;
    private final double duration; 
    private final String preferredTime;
    private final String userId;

    public Event(long id, String name, String address, double duration, String preferredTime, String userId) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.duration = duration;
        this.preferredTime = preferredTime;
        this.userId = userId;
    }
}

//name, address, timerange