import React from 'react';

const UserHorizontalScroll = ({ users }) => {
  console.log("Users in UserHorizontalScroll:", users);

  return (
    <div className="user-horizontal-scroll bg-white rounded-lg shadow p-4 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-3">Suggestions d'utilisateurs</h3>
      {users && users.length > 0 ? (
        <div className="flex space-x-4">
          {users.map((user, index) => (
            <div key={user.Id || user.id || index} className="flex flex-col items-center space-y-2 min-w-[100px]">
              <img
                src={user.ProfilePicture || user.profilePicture || '/default-avatar.png'}
                alt={`${user.FirstName || user.firstName} ${user.LastName || user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {(user.FirstName || user.firstName)} {(user.LastName || user.lastName)}
                </p>
                <p className="text-xs text-gray-500">{user.Username || user.username}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucun utilisateur trouvé</p>
      )}
    </div>
  );
};

export default UserHorizontalScroll;
