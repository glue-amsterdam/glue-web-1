export async function getTheme() {
  return {
    backgroundColor: "#FFFFFF",
    primaryColor: "#10069F",
    blackColor: "#000000",
    whiteColor: "#FFFFFF",
    upToThreeParticipantsColor: "#d0b6d5",
    hubColor: "#10069F",
    specialProgramColor: "#090359",

  }
}
/* export async function getTheme() {
    const res = await fetch('https://api.com/theme', {
      next: {
        tags: ['theme'],
        revalidate: 3600,
      },
    })
  
    return res.json()
  } */
