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


// This is a class representing a time range, it mirrors the TimeRange class in the server
export default class TimeRange {
    constructor(start, duration) {
        this.start = start;
        this.duration = duration;
        this.end = start + duration;
    }
    getStartTime() {
        return this.start;
    }
    getEndTime() {
        return this.end;
    }
    
    static getTimeInMinutes(hours, minutes) {
        if (hours < 8 || hours > 19) {
            throw new Error("Hours can only be 8 through 19 (inclusive).");
        }
        if (minutes < 0 || minutes > 59) {
            throw new Error("Minutes can only be 0 through 59 (inclusive).");
        }
        return (hours * 60) + minutes;
    }
    static getStartOfDay() {
        return this.getTimeInMinutes(8, 0);
    } 
    static getEndOfDay() {
        return this.getTimeInMinutes(19, 59);
    }
}
