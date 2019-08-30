const express = require(`express`)
const TaskModel = require(`../models/task`)
const auth = require(`../middleware/auth`)

const router = new express.Router()

//auth route --> create a task
router.post(`/tasks`, auth, async (req, res) => {
	const newTask = new TaskModel({
		...req.body,
		owner: req.user._id
	})

	try {
		await newTask.save()		
		res.status(201).send(newTask)

	} catch(e) {		
		res.status(400).send({ error: e.message })
	}	
})

/* auth route --> read all tasks
	 /tasks --> to fetch all tasks
	 /tasks?status=true --> to filter tasks
	 /tasks?limit=10&skip=10 --> to paginate results
	 /task?sortby=createdAt:[asc || desc] --> to sort in ascending or descending order */
router.get(`/tasks`, auth, async (req, res) => {
	const match = {}
	const sort = {}

	if (req.query.status === `true` || req.query.status === `false`) {
		match.status = req.query.status === `true`
	}

	if (/^createdAt:(desc|asc)$/.test(req.query.sortby)) {
		const parts = req.query.sortby.split(`:`)
		sort[parts[0]] = parts[1] === `desc` ? -1 : 1 //-1 --> descending (from new to old), 1 --> ascending (from old to new) 		
	}

	try {		
		await req.user.populate({
			path: `tasks`, 
			match,
			options: {
				limit: +req.query.limit, //limit, skip --> if not provided will be ignored by mongoose
				skip: +req.query.skip,
				sort 
			}
		}).execPopulate()
		if (req.user.tasks.length === 0) {
			return res.status(200).send({ message: `no tasks created yet` })
		}
		res.status(200).send(req.user.tasks)

	} catch(e) {		
			res.status(500).send()
	}
})

//auth route --> read a single task
router.get(`/tasks/:id`, auth, async (req, res) => {
	const _id = req.params.id;

	try {
		const task = await TaskModel.findOne({ _id, owner: req.user._id })
		if (!task) {
			res.status(404).send()
		}
		res.status(200).send(task)

	} catch(e) {
			if(e.name === `CastError`) { //req.params.id is poorly formated
				return res.status(400).send({ error: `invalid id` })
			}
			res.status(500).send()
	}	
})

//auth route --> update a single task
router.patch(`/tasks/:id`, auth, async (req, res) => {	
	const updates = Object.keys(req.body)	
	if (updates.length === 0) {
		return res.status(400).send({ error: `no updates provided` })
	}

	const allowedToUpdate = [`description`, `status`]
	const isValidOperation = updates.every(update => allowedToUpdate.includes(update))
	if(!isValidOperation) {
		return res.status(400).send({ error: `invalid update names` })
	}

	try { 
		const taskToUpdate = await TaskModel.findOne({ _id: req.params.id, owner: req.user._id })		
		if(!taskToUpdate) {
			return res.status(404).send()
		}
		updates.forEach(update => taskToUpdate[update] = req.body[update])
		await taskToUpdate.save()		
		res.status(200).send(taskToUpdate)

	} catch(e) {
			if(e.name === `CastError`) { //req.params.id is poorly formated
					return res.status(400).send({ error: `invalid id` })
			}			
			res.status(400).send(e.message) //validation errors
	}
})

//auth route --> delete a single task
router.delete(`/tasks/:id`, auth, async (req, res) => { 
	try {		
		const deletedTask = await TaskModel.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
		if (!deletedTask) {
			return res.status(404).send()
		}
		res.status(200).send(deletedTask)

	} catch(e) {
		if(e.name === `CastError`) { //req.params.id is poorly formated
			return res.status(400).send({ error: `invalid id` }) 
		}
		res.status(500).send();
	}
})

module.exports = router;