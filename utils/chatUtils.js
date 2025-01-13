function addVizibilityOrNot(users,visibility,userId){
    let addVizibility = false;
    let oppontUserId;
    for(let i = 0; i < users.length; i++){
        if (users[i] !== userId) {
            oppontUserId = users[i]
        }
    }
    
    for(let i = 0; i < visibility.length; i++){
        addVizibility = true
        if (visibility[i].user === oppontUserId) {
            addVizibility = false
            break;
        }
    }
    return {addVizibility,oppontUserId}
}

function checkVisibilityExists(visibility,userId){
    for(let i = 0; i < visibility.length; i++){
        if (visibility[i].user === userId) {
            return true
        }
    }
    return false;
}

module.exports = {addVizibilityOrNot,checkVisibilityExists}
