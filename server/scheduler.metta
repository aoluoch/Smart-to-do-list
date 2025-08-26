# MeTTa Task Scheduler Implementation
# File structure:
# - metta_scheduler.metta (MeTTa knowledge base and algorithms)
# - task_scheduler.py (Python-MeTTa interface)
# - app.py (Flask backend)
# - requirements.txt

# =============================================================================
# File: metta_scheduler.metta
# =============================================================================

; Task representation in MeTTa
; Format: (task ID Description Deadline Priority Duration Status Dependencies)
(task TaskA "Write project proposal" "2024-01-15" High 120 Pending ())
(task TaskB "Research market analysis" "2024-01-12" Medium 180 Pending ())
(task TaskC "Review proposal draft" "2024-01-18" Medium 60 Pending (TaskA))
(task TaskD "Prepare presentation" "2024-01-20" High 90 Pending (TaskA TaskC))
(task TaskE "Submit final proposal" "2024-01-25" High 30 Pending (TaskD))

; Priority levels (lower number = higher priority)
(priority High 1)
(priority Medium 2)
(priority Low 3)

; Status definitions
(status Pending 0)
(status InProgress 1)
(status Completed 2)

; Helper functions to extract task attributes
(= (getTaskId (task $id $desc $deadline $priority $duration $status $deps)) $id)
(= (getDescription (task $id $desc $deadline $priority $duration $status $deps)) $desc)
(= (getDeadline (task $id $desc $deadline $priority $duration $status $deps)) $deadline)
(= (getPriority (task $id $desc $deadline $priority $duration $status $deps)) $priority)
(= (getDuration (task $id $desc $deadline $priority $duration $status $deps)) $duration)
(= (getStatus (task $id $desc $deadline $priority $duration $status $deps)) $status)
(= (getDependencies (task $id $desc $deadline $priority $duration $status $deps)) $deps)

; Query functions
(= (findTask $taskId)
   (match &self (task $taskId $desc $deadline $priority $duration $status $deps)
          (task $taskId $desc $deadline $priority $duration $status $deps)))

(= (getTasksByStatus $status)
   (match &self (task $id $desc $deadline $priority $duration $status $deps)
          (task $id $desc $deadline $priority $duration $status $deps)))

(= (getPriorityValue $priority)
   (match &self (priority $priority $value) $value))

(= (getStatusValue $status)
   (match &self (status $status $value) $value))

; Check if task has no incomplete dependencies
(= (isReady $taskId)
   (let $task (findTask $taskId)
     (let $deps (getDependencies $task)
       (if (== $deps ())
           True
           (allDependenciesComplete $deps)))))

; Check if all dependencies are completed
(= (allDependenciesComplete ())
   True)
(= (allDependenciesComplete ($head . $tail))
   (let $depTask (findTask $head)
     (let $depStatus (getStatus $depTask)
       (if (== $depStatus Completed)
           (allDependenciesComplete $tail)
           False))))

;reconfiguring the urgency caculator to also make deadline as important as priority
;caculate highest /max   day to deadline  among all tasks
(= (getMaxDays)
   (let $allDeadlines (match &self (task $id $desc $deadline $priority $duration $status $deps) $deadline)
     (let $allDays (map daysDifference $allDeadlines)
       (maxList $allDays))))

;helper function to get max from the list
(= (maxList ($x)) $x)
(= (maxList ($x . $rest))
   (let $maxRest (maxList $rest)
     (if (> $x $maxRest) $x $maxRest)))





; New urgency calculation
(= (calculateUrgency $taskId)
   (let $task (findTask $taskId)
     (let $priority (getPriority $task)
       (let $priorityValue (getPriorityValue $priority)
         (let $deadline (getDeadline $task)
           (let $daysUntilDeadline (daysDifference $deadline)
             (let $maxDays (getMaxDays)
               (+ (* $priorityValue 10) (- $maxDays $daysUntilDeadline)))))))))

; Mock function for days difference (would be implemented with actual date logic)
(= (daysDifference "2024-01-15") 5)
(= (daysDifference "2024-01-12") 2)
(= (daysDifference "2024-01-18") 8)
(= (daysDifference "2024-01-20") 10)
(= (daysDifference "2024-01-25") 15)

; Get ready tasks (no incomplete dependencies)
(= (getReadyTasks)
   (match &self (task $id $desc $deadline $priority $duration Pending $deps)
          (if (isReady $id)
              (task $id $desc $deadline $priority $duration Pending $deps)
              ())))

; Sort tasks by urgency
(= (sortTasksByUrgency $tasks)
   (quickSort $tasks compareUrgency))

; Compare function for urgency sorting
(= (compareUrgency $task1 $task2)
   (let $id1 (getTaskId $task1)
     (let $id2 (getTaskId $task2)
       (let $urgency1 (calculateUrgency $id1)
         (let $urgency2 (calculateUrgency $id2)
           (< $urgency1 $urgency2))))))

; Quick sort implementation
(= (quickSort () $compare) ())
(= (quickSort ($pivot . $rest) $compare)
   (let $lesser (filter (lambda $x (not ($compare $pivot $x))) $rest)
     (let $greater (filter (lambda $x ($compare $pivot $x)) $rest)
       (append (quickSort $lesser $compare)
               (cons $pivot (quickSort $greater $compare))))))

; Main scheduling function
(= (scheduleTasks)
   (let $readyTasks (getReadyTasks)
     (sortTasksByUrgency $readyTasks)))

; Get next recommended task
(= (getNextTask)
   (let $schedule (scheduleTasks)
     (if (== $schedule ())
         None
         (car $schedule))))

; Update task status
(= (updateTaskStatus $taskId $newStatus)
   (let $task (findTask $taskId)
     (if (== $task ())
         False
         (let $desc (getDescription $task)
           (let $deadline (getDeadline $task)
             (let $priority (getPriority $task)
               (let $duration (getDuration $task)
                 (let $deps (getDependencies $task)
                   (progn
                     (remove-atom &self $task)
                     (add-atom &self (task $taskId $desc $deadline $priority $duration $newStatus $deps))
                     True)))))))))

; Add new task
(= (addTask $taskId $desc $deadline $priority $duration $deps)
   (add-atom &self (task $taskId $desc $deadline $priority $duration Pending $deps)))

; Remove task
(= (removeTask $taskId)
   (let $task (findTask $taskId)
     (if (== $task ())
         False
         (progn
           (remove-atom &self $task)
           True))))

; Check for circular dependencies
(= (hasCircularDependency $taskId)
   (hasCircularDependencyHelper $taskId ()))

(= (hasCircularDependencyHelper $taskId $visited)
   (if (member $taskId $visited)
       True
       (let $task (findTask $taskId)
         (let $deps (getDependencies $task)
           (checkDepsForCircular $deps (cons $taskId $visited))))))

(= (checkDepsForCircular () $visited) False)
(= (checkDepsForCircular ($head . $tail) $visited)
   (if (hasCircularDependencyHelper $head $visited)
       True
       (checkDepsForCircular $tail $visited)))

; Get task statistics
(= (getTaskStats)
   (let $allTasks (match &self (task $id $desc $deadline $priority $duration $status $deps) $status)
     (let $totalTasks (length $allTasks)
       (let $completedTasks (length (filter (lambda $s (== $s Completed)) $allTasks))
         (let $pendingTasks (length (filter (lambda $s (== $s Pending)) $allTasks))
           (let $inProgressTasks (length (filter (lambda $s (== $s InProgress)) $allTasks))
             (stats $totalTasks $completedTasks $pendingTasks $inProgressTasks))))))) 
             
                    