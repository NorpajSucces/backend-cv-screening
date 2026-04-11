const mongoose = require('mongoose')
const Candidate = require('../models/Candidate')
const JobPosting = require('../models/JobPosting')

// stats cards
const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalJobs,
            totalApplicants,
            acceptedApplicants,
            rejectedApplicants,
            pendingApplicants
        ] = await Promise.all([
           JobPosting.countDocuments(),
            Candidate.countDocuments(),
            Candidate.countDocuments({ status: 'advanced' }),
            Candidate.countDocuments({ status: 'rejected' }),
            Candidate.countDocuments({ status: 'processed' })
        ])

        res.json({
            totalJobs,
            totalApplicants,
            acceptedApplicants,
            rejectedApplicants,
            pendingApplicants
        })

    } catch(error) {
        next(error)
    }
}


// pie chart
const getJobDistribution = async (req, res, next) => {
    try {
        const topN = 4

        // total candidate
        const totalCandidates = await Candidate.countDocuments()

        // get 4 jobs
        const topJobs = await Candidate.aggregate([
            {
                $group: {
                    _id: '$jobId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: topN },
            {
                $lookup: {
                    from: 'jobpostings',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'job'
                }
            },
            {$unwind: '$job'},
            {
                $project: {
                    _id: 0,
                    jobId: '$_id',
                    jobTitle: '$job.title',
                    count: 1
                }
            }
        ])

        // calculate totals
        const topTotal = topJobs.reduce((sum, job) => sum + job.count, 0)
        const othersCount = totalCandidates - topTotal

        const result = [...topJobs]

        if(othersCount > 0) {
            result.push({
                jobId: 'others',
                jobTitle: 'Others',
                count: othersCount
            })
        }

        // add percentage
        result.forEach(item => {
            item.percentage = Math.round((item.count / totalCandidates) * 100)
        })

        res.json(result)

    } catch (error) {
        next(error)
    }
}


// bar chart
const getJobStatusBreakdown = async (req, res, next) => {
    try {
        const { jobId, type } = req.query
        let matchCondition = {}

        if (type === 'others') {
            // CASE: Others — exclude top 4 jobs
            const topJobs = await Candidate.aggregate([
                {
                    $group: {
                        _id: '$jobId',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 4 }
            ])

            const topJobIds = topJobs.map(j => j._id)

            matchCondition = {
                jobId: { $nin: topJobIds }
            }
        } else if (jobId) {
            // CASE: specific job
            matchCondition = {
                jobId: new mongoose.Types.ObjectId(jobId)
            }
        }
        // CASE: no params — matchCondition stays {} → aggregate ALL candidates

        // aggregate only relevant status
        const statusData = await Candidate.aggregate([
            {
                $match: {
                    ...matchCondition,
                    status: { $in: ['advanced', 'rejected', 'processed'] }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        // map to frontend format
        const result = {
            accepted: 0,
            rejected: 0,
            pending: 0
        }

        statusData.forEach(item => {
            if (item._id === 'advanced') result.accepted = item.count
            if (item._id === 'rejected') result.rejected = item.count
            if (item._id === 'processed') result.pending = item.count
        })

        res.json(result)

    } catch (error) {
        next(error)
    }
}


// recent updated candidates
const getRecentCandidates = async (req, res, next) => {
    try {
        const candidates = await Candidate.find()
        .sort({ appliedAt: -1 }) //most recently applied applicants
        .limit(5)
        .select('_id name email aiScore status appliedAt') //only needed fields

        // map to frontend format
        const result = candidates.map(c => ({
            id: c._id,
            name: c.name,
            email: c.email,
            score: c.aiScore,
            status: c.status,
            appliedAt: c.appliedAt
        }))

        res.json(result)
    } catch (error) {
        next(error)
    }
}

module.exports = { 
    getDashboardStats, 
    getJobDistribution, 
    getJobStatusBreakdown, 
    getRecentCandidates 
};