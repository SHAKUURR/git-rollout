import "./App.css";
import { useEffect, useState } from "react";
const initialFriends = [
	{
		userid: 108751084,
		username: "SHAKUURR",
		userlogin: "SHAKUURR",
		userimage: "https://avatars.githubusercontent.com/u/108751084?v=4",
		follower: 5,
		following: 5,
		repos: 68,
		status: "following",
		joined: "2022-07-05T16:02:06Z",
		twitter: "AdemolaSalman",
	},
	// {
	// 	userid: 933372,
	// 	username: "Sarah",
	// 	userlogin: "saro",
	// 	userimage: "https://i.pravatar.cc/60?u=933372",
	// 	status: "follow",
	// },
	// {
	// 	userid: 499476,
	// 	username: "Anthony",
	// 	userlogin: "antono",
	// 	userimage: "https://i.pravatar.cc/48?u=499476",
	// 	status: "follow",
	// },
];
function App() {
	const [selectedFriend, setSelectedFriend] = useState(null);
	const [user, setUser] = useState([]);
	const [isloading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [userInput, setUserInput] = useState("shakuurr");
	const [query, setQuery] = useState(userInput);
	const [friends, setFriends] = useState(() => {
		const storedFriends = JSON.parse(localStorage.getItem("friends"));
		return storedFriends || initialFriends;
	});

	useEffect(() => {
		const storedFriends = JSON.parse(localStorage.getItem("friends"));
		if (storedFriends) {
			setFriends(storedFriends);
		} else {
			setFriends(initialFriends);
		}
	}, []);

	function handleAddFriend(friend) {
		const isFriendExists = friends.find(
			(existingFriend) => existingFriend.userid === friend.userid
		);
		if (!isFriendExists) {
			const updatedFriends = [...friends, friend];
			setFriends(updatedFriends);
			localStorage.setItem("friends", JSON.stringify(updatedFriends));
		}
	}
	function handleSubmit(e) {
		const newUsers = {
			userid: user.userid,
			username: user.username || user.userlogin,
			userlogin: user.userlogin,
			userimage: user.userimage,
			repos: user.repos,
			follower: user.follower,
			following: user.following,
			status: "follow",
			joined: user.joined,
			twitter: user.twitter,
		};
		handleAddFriend(newUsers);
	}
	function handleSelection(friend) {
		setSelectedFriend(friend);
	}

	function handleQuery(e) {
		e.preventDefault();
		if (!userInput) return;
		setSelectedFriend(null);
		setQuery(userInput);
		setUserInput("");
	}

	function handleDeleteFriend(id) {
		setFriends((friends) => friends.filter((friend) => friend.userid !== id));
		setSelectedFriend(null);
	}

	useEffect(
		function () {
			async function fetchNames() {
				try {
					setIsLoading(true);
					setError("");
					const res = await fetch(`https://api.github.com/users/${query}`);
					if (!res.ok) {
						// Handle the case when the user is not found
						if (res.status === 404) {
							setError("User not found");
						} else {
							throw new Error(
								"Something went wrong with fetching user details"
							);
						}
					}
					const data = await res.json();
					const transformedData = {
						userid: data.id,
						username: data.name || data.login,
						userlogin: data.login,
						userimage: data.avatar_url,
						status: "follow",
						follower: data.followers,
						following: data.following,
						repos: data.public_repos,
						joined: data.created_at,
						twitter: data.twitter_username,
					};
					setUser(transformedData);
				} catch (error) {
					setError(error.message);
				} finally {
					setIsLoading(false);
				}
			}

			fetchNames();
		},
		[query]
	);

	useEffect(
		function () {
			function storeFriend() {
				localStorage.setItem("friends", JSON.stringify(friends));
			}
			storeFriend();
		},
		[friends]
	);

	return (
		<div className="App">
			<SearchArea
				query={query}
				handleQuery={handleQuery}
				userInput={userInput}
				setUserInput={setUserInput}
			/>
			<main>
				<FriendList onSelection={handleSelection} friends={friends} />
				{/* {selectedFriend && <FriendDetails selectedFriend={selectedFriend} />} */}
				<FriendDetails
					selectedFriend={selectedFriend}
					user={user}
					onSubmit={handleSubmit}
					friends={friends}
					onFriendDelete={handleDeleteFriend}
					loading={isloading}
					error={error}
				/>
			</main>
			<Footer />
		</div>
	);
}

function SearchArea({ query, handleQuery, userInput, setUserInput }) {
	return (
		<header>
			<img src="/logo192.png" alt="logo" />
			<form value={query} onSubmit={handleQuery}>
				<input
					type="text"
					placeholder="Search for any name..."
					className="search"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
				/>
				<button className="search-btn">Search</button>
			</form>
		</header>
	);
}

function FriendList({ onSelection, friends }) {
	return (
		<ul className="list-container">
			{friends.map((friend) => (
				<Friend friend={friend} key={friend.userid} onSelection={onSelection} />
			))}
		</ul>
	);
}

function Friend({ friend, onSelection }) {
	const dateString = friend.joined;
	const dateObject = new Date(dateString);

	const year = dateObject.getFullYear();
	const month = `0${dateObject.getMonth() + 1}`.slice(-2); // Adding 1 because months are zero-indexed
	const day = `0${dateObject.getDate()}`.slice(-2);

	const formattedDate = `${day}/${month}/${year}`;
	return (
		<li className="list" onClick={() => onSelection(friend)}>
			<img src={friend.userimage} alt={friend.username} />
			<div className="name">
				<h3>{friend.username}</h3>
				<p>{`@${friend.userlogin}`}</p>
			</div>

			<p
				className={`list-status ${
					friend.status === "following"
						? "following"
						: friend.status === "follow"
						? "follow"
						: ""
				}`}
			>
				{formattedDate}
			</p>
		</li>
	);
}

function ErrorMessage({ message }) {
	return (
		<p className="fail">
			<span>🏮</span>
			{message}
		</p>
	);
}
function Loader() {
	return <p className="loading">Loading...</p>;
}
function FriendDetails({
	selectedFriend,
	user,
	onSubmit,
	friends,
	onFriendDelete,
	loading,
	error,
}) {
	const chooseFriend = selectedFriend || user;
	const userexist = friends.find(
		(userDey) => userDey.userid === chooseFriend.userid
	);
	return (
		<div className="detail-container">
			{loading && <Loader />}
			{!loading && !error && (
				<>
					<img
						src={chooseFriend.userimage}
						alt={chooseFriend.username || chooseFriend.userlogin}
					/>
					<div className="profile-name">
						<h4>{chooseFriend.username || chooseFriend.userlogin}</h4>
						<p>{`@ ${chooseFriend.userlogin}`}</p>
					</div>
					<div className="profile-details">
						<div className="detail-box">
							<a
								href={`https://github.com/${chooseFriend.userlogin}?tab=followers`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<h5>Followers</h5>
								<p>{chooseFriend.follower}</p>
							</a>
						</div>
						<div className="detail-box">
							<a
								href={`https://github.com/${chooseFriend.userlogin}?tab=following`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<h5>Following</h5>
								<p>{chooseFriend.following}</p>
							</a>
						</div>
						<div className="detail-box">
							<a
								href={`https://github.com/${chooseFriend.userlogin}?tab=repositories`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<h5>Repos</h5>
								<p>{chooseFriend.repos}</p>
							</a>
						</div>
					</div>
					{chooseFriend.twitter && (
						<a
							href={`https://twitter.com/${chooseFriend.twitter}`}
							target="_blank"
							rel="noopener noreferrer"
							className="connect"
						>
							Connect
						</a>
					)}
					{userexist ? (
						<button
							onClick={() => onFriendDelete(chooseFriend.userid)}
							className="removelist"
						>
							Remove user from list
						</button>
					) : (
						<button onClick={onSubmit} className="addtolist">
							Add user to list <i className="fa-solid fa-user-group"></i>
						</button>
					)}
				</>
			)}
			{error && <ErrorMessage message={error} />}
		</div>
	);
}

function Footer() {
	return (
		<footer>
			<p>
				Built upon version{" "}
				<a
					href={`https://git-roll.vercel.app/`}
					target="_blank"
					rel="noopener noreferrer"
				>
					1.0
				</a>{" "}
				by{" "}
				<a
					href={`https://www.linkedin.com/in/salman-abdulshakur-92802124a/`}
					target="_blank"
					rel="noopener noreferrer"
				>
					SHAKUURR🎁
				</a>
			</p>
		</footer>
	);
}

export default App;
