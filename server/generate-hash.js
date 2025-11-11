import bcrypt from "bcrypt";

const passwords = [
  { name: "Gestor", pass: "Gestor123!" },
  { name: "Tecnico", pass: "Tecnico123!" },
  { name: "SysAdmin", pass: "SysAdmin123!" }
];

for (const user of passwords) {
  const hash = await bcrypt.hash(user.pass, 10);
  console.log(`${user.name}: ${hash}`);
}
