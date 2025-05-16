namespace TTH.Backend.Data
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = "tthdb";
        public string UsersCollectionName { get; set; } = "users";
        public string ArticlesCollectionName { get; set; } = "articles";
        public string MessagesCollectionName { get; set; } = "messages";
        public string FriendRequestsCollectionName { get; set; } = "friendRequests";
        public bool DirectConnection { get; set; } = true;
        public int ServerSelectionTimeoutMS { get; set; } = 5000;
    }
}
