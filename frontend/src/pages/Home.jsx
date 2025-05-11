import SideBar from "../components/sidebar";
import HomeExistUser from "../components/homePage/HomeExistUser";

const surveyList = [
  "Student",
  "Major in CS",
  "Music / Movie / Shopping",
  "Occasionally use English",
  "Have been abroad for travel",
  "Taking test for graduation requirement",
];

const Home = () => {
  return (
    <div className="flex flex-row">
      <SideBar userName="Gildong Hong" />
      <div className="flex flex-col w-full h-full bg-white px-12 mt-10">
        <HomeExistUser
          userName="Gildong Hong"
          pastLevel="Intermediate"
          goalLevel="Advanced"
          testDate="2023-10-15"
          surveyList={surveyList}
          onEdit={() => console.log("Edit User Info")}
        />
      </div>
    </div>
  );
};

export default Home;
