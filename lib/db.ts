import mysql from "serverless-mysql";
export const db = mysql({
    config: {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
    },
});

export default async function executeQuery({
    query,
    values = [],
}: {
    query: string;
    values?: any[];
}) {
    try {
        const results = await db.query<any>(query, values);
        await db.end();
        if (Array.isArray(results)) {
            const stripped = results.map((rowDataPacket: any) =>
                Object.assign({}, rowDataPacket)
            );
            return stripped;
        } else {
            return results;
        }
    } catch (error) {
        throw  error ;
    }
}

export const executeTransaction = async (
    queries: string[],
    values: any[][]
) => {
    try {
        const transaction = await db.transaction();

        const results: any[] = [];
        for (let i = 0; i < queries.length; i++) {
            transaction
                .query(queries[i], values[i])
                .query((r: any) => results.push(r.insertId));
        }

        transaction.rollback((e: any) => {
            // error
            console.log(e);
            return { error: e };
        });
        transaction.commit();
        return results;

        // return insertIDs
    } catch (e) {
        return { error: e };
    }
};
