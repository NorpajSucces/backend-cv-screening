const Candidate = require('../models/Candidate')

const CandidateController = {
    find: (req, res, next) => {
        Candidate.find({})
        .then(candidate => {
            res.json(candidate)
        })
        .catch(error => {
            next(error)
        })
    },
    findById: (req, res, next) => {
        Candidate.findById(req.params.id)
        .then(candidate => {
            res.json(candidate)
        })
        .catch(error => {
            next(error)
        })
    },
    accept: (req, res, next) => {
        Candidate.findByIdAndUpdate(
            req.params.id,
            { status: 'advanced' },
            { new: true }
        )
        .then(candidate => {
            res.json({ message: 'Candidate accepted', candidate })
        })
        .catch(error => {
            next(error)
        })
    },
    reject: (req, res, next) => {
        Candidate.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        )
        .then(candidate => {
            res.json({ message: 'Candidate rejected', candidate })
        })
        .catch(error => {
            next(error)
        })
    }
}

module.exports = CandidateController