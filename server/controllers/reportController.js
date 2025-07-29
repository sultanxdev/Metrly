import Report from "../models/Report.js"

// @desc    Get all reports for a user
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: reports.length, reports })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
export const getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) {
      return next(new Error("Report not found", 404))
    }

    // Ensure user owns the report or is an admin
    if (report.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new Error("Not authorized to view this report", 403))
    }

    res.status(200).json({ success: true, report })
  } catch (err) {
    next(err)
  }
}

// @desc    Get shared report (public access)
// @route   GET /api/reports/shared/:id
// @access  Public
export const getSharedReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) {
      return next(new Error("Report not found", 404))
    }

    // For shared reports, we don't check user ownership.
    // You might add a flag to the report model (e.g., `isShareable: true`)
    // and check that here if you want to control sharing.
    res.status(200).json({ success: true, report })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)

    if (!report) {
      return next(new Error("Report not found", 404))
    }

    // Ensure user owns the report or is an admin
    if (report.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new Error("Not authorized to delete this report", 403))
    }

    await report.deleteOne()

    res.status(200).json({ success: true, message: "Report deleted successfully" })
  } catch (err) {
    next(err)
  }
}
