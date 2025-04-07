const db = require("../config/db");
const moment = require("moment-timezone");

exports.checkASAPOpen = async (req, res) => {
  try {
    const now = moment().tz("America/New_York");

    const day = now.format("dddd");
    const time = now.format("HH:mm:ss");

    const [data] = await db.query("SELECT * FROM opening_closing WHERE day=?", [
      day,
    ]);

    const schedule = data[0];

    if (!schedule.is_day_on) {
      return res.status(200).send({
        success: true,
        message: "Check time",
        data: false,
      });
    }

    const startTime = moment(schedule.start_time, "HH:mm:ss");
    const endTime = moment(schedule.end_time, "HH:mm:ss");
    const currentTime = moment(time, "HH:mm:ss");

    const isOpen = currentTime.isBetween(startTime, endTime, undefined, "[)");

    res.status(200).send({
      success: true,
      message: "Check time",
      data: isOpen,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// update Opening Closing
exports.updateOpeningClosing = async (req, res) => {
  try {
    const id = req.params.id;

    const { start_time, end_time } = req.body;

    console.log("start_time", start_time);

    const [preData] = await db.query(
      `SELECT * FROM opening_closing WHERE id =?`,
      [id]
    );

    // Execute the update query
    const [result] = await db.query(
      "UPDATE opening_closing SET start_time=?, end_time = ? WHERE id=?",
      [
        start_time || preData[0]?.start_time,
        end_time || preData[0]?.end_time,
        id,
      ]
    );

    // Check if the Opening Closing was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Opening Closing not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Opening Closing updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Opening Closing",
      error: error.message,
    });
  }
};

// get all Opening Closing
exports.getAllOpeningClosing = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM opening_closing");

    let allNewData = [];

    for (const singleData of data) {
      const formatTime = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHour = hours % 12 || 12;
        return `${formattedHour}:${minutes
          .toString()
          .padStart(2, "0")} ${ampm}`;
      };

      const generateTimeSlots = (startTime, endTime) => {
        const slots = [];
        let [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        while (
          startHour < endHour ||
          (startHour === endHour && startMinute < endMinute)
        ) {
          const currentSlotStart = `${startHour
            .toString()
            .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}:00`;

          let nextHour = startHour;
          let nextMinute = startMinute + 60;

          if (nextMinute >= 60) {
            nextMinute -= 60;
            nextHour += 1;
          }

          const currentSlotEnd = `${nextHour
            .toString()
            .padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}:00`;

          slots.push({
            start: formatTime(currentSlotStart),
            end: formatTime(
              nextHour < endHour ||
                (nextHour === endHour && nextMinute <= endMinute)
                ? currentSlotEnd
                : `${endHour.toString().padStart(2, "0")}:${endMinute
                    .toString()
                    .padStart(2, "0")}:00`
            ),
          });

          startHour = nextHour;
          startMinute = nextMinute;

          if (
            startHour > endHour ||
            (startHour === endHour && startMinute > endMinute)
          ) {
            break;
          }
        }

        return slots;
      };

      // Example usage
      const startTime = singleData.start_time;
      const endTime = singleData.end_time;

      const timeSlots = generateTimeSlots(startTime, endTime);

      const time_slots = timeSlots.map((slot) => `${slot.start} - ${slot.end}`);

      const newData = { day_info: singleData, timeSlots: time_slots };
      allNewData.push(newData);
    }
    res.status(200).send({
      success: true,
      message: "Get all Opening Closing",
      data: allNewData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Opening Closing",
      error: error.message,
    });
  }
};

// get Single Opening Closing
exports.getSingleOpeningClosing = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM opening_closing WHERE id =?", [
      id,
    ]);

    const formatTime = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHour = hours % 12 || 12;
      return `${formattedHour}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    };

    const generateTimeSlots = (startTime, endTime) => {
      const slots = [];
      let [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      while (
        startHour < endHour ||
        (startHour === endHour && startMinute < endMinute)
      ) {
        const currentSlotStart = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}:00`;

        let nextHour = startHour;
        let nextMinute = startMinute + 60;

        if (nextMinute >= 60) {
          nextMinute -= 60;
          nextHour += 1;
        }

        const currentSlotEnd = `${nextHour
          .toString()
          .padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}:00`;

        slots.push({
          start: formatTime(currentSlotStart),
          end: formatTime(
            nextHour < endHour ||
              (nextHour === endHour && nextMinute <= endMinute)
              ? currentSlotEnd
              : `${endHour.toString().padStart(2, "0")}:${endMinute
                  .toString()
                  .padStart(2, "0")}:00`
          ),
        });

        startHour = nextHour;
        startMinute = nextMinute;

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute > endMinute)
        ) {
          break;
        }
      }

      return slots;
    };

    // Example usage
    const startTime = data[0]?.start_time;
    const endTime = data[0]?.end_time;

    const timeSlots = generateTimeSlots(startTime, endTime);

    const time_slots = timeSlots.map((slot) => `${slot.start} - ${slot.end}`);

    res.status(200).send({
      success: true,
      message: "Get Single day Opening Closing",
      data: data[0],
      timeSlots: time_slots,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single day Opening Closing",
      error: error.message,
    });
  }
};

// update day on or off
exports.updateDayOnOrOff = async (req, res) => {
  try {
    const id = req.params.id;

    const { is_day_on } = req.body;

    // Execute the update query
    const [result] = await db.query(
      "UPDATE opening_closing SET is_day_on = ? WHERE id=?",
      [is_day_on, id]
    );

    // Check if the Opening Closing was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Opening Closing not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Opening Closing updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Opening Closing",
      error: error.message,
    });
  }
};
