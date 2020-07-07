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

public final class TimeRange {
    public static final int START_OF_DAY = getTimeInMinutes(8, 0);
    public static final int END_OF_DAY = getTimeInMinutes(19, 59);
    public static final TimeRange WHOLE_DAY = new TimeRange(0, 12 * 60);

    private final int start;
    private final int duration;
    private final int end;

    private TimeRange(int start, int duration) {
        this.start = start;
        this.duration = duration;
        this.end = this.end();
    }

    public static TimeRange fromStartDuration(int start, int duration) {
        return new TimeRange(start, duration);
    }

    public static TimeRange fromStartEnd(int start, int end) {
        return new TimeRange(start, end-start);
    }
    
    public int start() {
        return start;
    }

    public int duration() {
        return duration;
    }

    public int end() {
        return start + duration;
    }

    @Override
    public String toString() {
        return String.format("Range: [%d, %d)", start, start + duration);
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof TimeRange && equals(this, (TimeRange) other);
    }
    
    private static boolean equals(TimeRange a, TimeRange b) {
        return a.start == b.start && a.duration == b.duration;
    }

    public static int getTimeInMinutes(int hours, int minutes) {
        if (hours < 8 || hours > 19) {
            throw new IllegalArgumentException("Hours can only be 8 through 19 (inclusive).");
        }
        if (minutes < 0 || minutes > 59) {
            throw new IllegalArgumentException("Minutes can only be 0 through 59 (inclusive).");
        }
        return (hours * 60) + minutes;
    }
}
