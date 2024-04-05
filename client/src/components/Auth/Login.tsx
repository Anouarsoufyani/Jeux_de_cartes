import useAuth from "../../hooks/useAuth";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Card, Grid } from "@mui/material";

const LoginSchema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("The email is required to log in"),
    password: yup.string().required("Please type your password"),
  })
  .required();

interface LoginFormValues {
  email: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(LoginSchema),
  });

  const { login, error } = useAuth();

  const onSubmit = async (data: FieldValues) => {
    const { email, password } = data;
    const loginData = { email, password };
    login(loginData);
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <Card sx={{ minWidth: 800, mt: 10, p: 5 }}>
        <h4 className="text-center pt-5">Login</h4>
        <div className="container">
          <div className="row d-flex justify-content-center align-items-center">
            <div className="col-md-6 mt-5">
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error.message}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address :
                  </label>
                  <input
                    {...register("email")}
                    className={`form-control ${errors?.email ? "is-invalid" : ""
                      }`}
                    id="email"
                    aria-describedby="emailHelp"
                  />
                  {errors?.email && (
                    <p className="text-danger">{errors.email?.message}</p>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password :
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors?.password ? "is-invalid" : ""
                      }`}
                    {...register("password")}
                  />
                  {errors?.password && (
                    <p className="text-danger">{errors.password?.message}</p>
                  )}
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </Grid>
  );
};
export default Login;
