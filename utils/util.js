var utils = {
    formatRelativeTime: function (date) {
        const now = new Date();
        const diff = now - date;
      
        // Convert milliseconds to seconds
        const seconds = Math.floor(diff / 1000);
      
        if (seconds < 60) {
          return `${seconds}s`;
        }
      
        const minutes = Math.floor(seconds / 60);
      
        if (minutes < 60) {
          return `${minutes}m`;
        }
      
        const hours = Math.floor(minutes / 60);
      
        if (hours < 24) {
          return `${hours}h`;
        }
      
        const days = Math.floor(hours / 24);
      
        if (days < 7) {
          return `${days}d`;
        }
      
        const weeks = Math.floor(days / 7);

        if (weeks < 4) {
          return `${weeks}w`;
        }

        const months = Math.floor(weeks / 4);

        if (months < 12) {
          return `${months}m`;
        }
        
        const years = Math.floor(months / 12);
      
        return `${years}y`;
      }
}
module.exports = utils;