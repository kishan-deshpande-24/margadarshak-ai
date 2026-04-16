const supabase = require("../services/supabase")

function generateCode(){
  return Math.random().toString(36).substring(2,8)
}

// ================= CREATE TEAM =================
exports.createTeam = async (req,res)=>{
  try{
    const { name, userId } = req.body

    const invite_code = generateCode()

    const { data, error } = await supabase
      .from("teams")
      .insert([{
        name,
        created_by:userId,
        avatar:`https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        invite_code
      }])
      .select()

    if(error) return res.json({ error })

    await supabase.from("team_members").insert([{
      team_id:data[0].id,
      user_id:userId
    }])

    res.json({ team:data[0] })

  }catch(e){
    console.error(e)
    res.json({ error:"create failed" })
  }
}

// ================= JOIN TEAM =================
exports.joinTeam = async (req,res)=>{
  try{
    const { code, userId } = req.body

    const { data } = await supabase
      .from("teams")
      .select("*")
      .eq("invite_code", code)
      .single()

    if(!data) return res.json({ error:"Invalid code" })

    await supabase.from("team_members").insert([{
      team_id:data.id,
      user_id:userId
    }])

    res.json({ success:true })

  }catch(e){
    res.json({ error:"join failed" })
  }
}

// ================= GET TEAMS =================
exports.getTeams = async (req,res)=>{
  const { data } = await supabase.from("teams").select("*")
  res.json({ teams:data || [] })
}

// ================= MEMBERS =================
exports.getTeamMembers = async (req,res)=>{
  const { teamId } = req.params

  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)

  res.json({ members:data || [] })
}

// ================= SEND MESSAGE =================
exports.sendMessage = async (req,res)=>{
  const { teamId } = req.params
  const { userId, text } = req.body

  await supabase.from("team_messages").insert([{
    team_id:teamId,
    user_id:userId,
    text
  }])

  res.json({ success:true })
}

// ================= GET MESSAGES =================
exports.getMessages = async (req,res)=>{
  const { teamId } = req.params

  const { data } = await supabase
    .from("team_messages")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at",{ ascending:true })

  res.json({ messages:data || [] })
}

// ================= ANALYTICS =================
exports.getTeamAnalytics = async (req,res)=>{
  const { teamId } = req.params

  const members = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)

  const messages = await supabase
    .from("team_messages")
    .select("*")
    .eq("team_id", teamId)

  res.json({
    totalMembers: members.data?.length || 0,
    totalMessages: messages.data?.length || 0
  })
}